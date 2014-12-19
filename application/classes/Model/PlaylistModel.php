<?php
/**
 * Created by PhpStorm.
 * UserModel: Roman
 * Date: 15.12.14
 * Time: 11:49
 */

namespace Model;

use Model\Traits\StreamControl;
use MVC\Exceptions\ControllerException;
use MVC\Services\Database;
use MVC\Services\DB\DBQuery;
use Objects\Link;
use Objects\PlaylistTrack;
use Objects\Stream;
use Objects\Track;
use Tools\Common;
use Tools\Optional;
use Tools\Singleton;
use Tools\System;

/**
 * Class PlaylistModel
 * @package Model
 */
class PlaylistModel extends Model implements \Countable {

    use Singleton, StreamControl;

    protected $key;

    /** @var UserModel $user */
    private $user;

    private $tracks_count;
    private $tracks_duration;

    private $status;
    private $started_from;
    private $started;


    public function __construct($id) {
        parent::__construct();
        $this->user = AuthUserModel::getInstance();
        $this->key = $id;
        $this->reload();
    }

    /**
     * @throws ControllerException
     * @return $this
     */
    public function reload() {

        Database::doInConnection(function (Database $db) {

            $query = $db->getDBQuery()->selectFrom("r_streams a")
                ->innerJoin("r_static_stream_vars b", "a.sid = b.stream_id")
                ->where("a.sid", $this->key)
                ->select("a.uid, a.started, a.started_from, a.status, b.tracks_count, b.tracks_duration");

            $stats = $db->fetchOneRow($query)
                ->getOrElseThrow(ControllerException::noStream($this->key));

            if (intval($stats["uid"]) !== $this->user->getID()) {
                throw ControllerException::noPermission();
            }

            $this->tracks_count = intval($stats["tracks_count"]);
            $this->tracks_duration = intval($stats["tracks_duration"]);

            $this->status = intval($stats["status"]);
            $this->started = intval($stats["started"]);
            $this->started_from = intval($stats["started_from"]);

        });

        return $this;

    }

    /**
     * @param int|null $time
     * @return Optional
     */
    public function getStreamPosition($time = null) {

        if ($this->tracks_duration == 0) {
            return Optional::ofNull(0);
        }

        if ($this->status == 0) {
            return Optional::ofNull(null);
        }

        if (is_null($time)) {
            $time = System::time();
        }

        $position = ($time - $this->started + $this->started_from) % $this->tracks_duration;

        return Optional::ofNull($position);

    }

    /**
     * @return mixed
     */
    public function getTrackInStream() {
        return $this->tracks_count;
    }

    /**
     * @return mixed
     */
    public function getStreamDuration() {
        return $this->tracks_duration;
    }

    /**
     * @param $tracks
     * @return $this
     */
    public function addTracks($tracks) {

        $this->doAtomic(function () use (&$tracks) {

            $tracksToAdd = explode(",", $tracks);
            $initialPosition = $this->tracks_count;
            $initialTimeOffset = $this->tracks_duration;

            foreach($tracksToAdd as $track) {

                Track::getByID($track)
                    ->then(function ($trackObject) use (&$initialPosition, &$initialTimeOffset) {

                        /** @var Track $trackObject */

                        // Skip foreign tracks
                        if ($trackObject->getUserID() != $this->user->getID()) return;

                        $uniqueID = $this->generateUniqueID();

                        $linker = new Link();

                        $linker->setStreamID($this->key);
                        $linker->setTrackID($trackObject->getID());
                        $linker->setTrackOrder(++$initialPosition);
                        $linker->setUniqueID($uniqueID);
                        $linker->setTimeOffset($initialTimeOffset);

                        $linker->save();

                        $initialTimeOffset += $trackObject->getDuration();

                    });

            }

        });

        return $this;

    }

    /**
     * @param $tracks
     * @return $this
     */
    public function removeTracks($tracks) {

        $this->doAtomic(function () use (&$tracks) {

            Database::doInConnection(function (Database $db) use ($tracks) {
                $db->executeUpdate("DELETE FROM r_link WHERE FIND_IN_SET(unique_id, ?)", [$tracks]);
                $db->executeUpdate("CALL POptimizeStream(?)", [$this->key]);
                $db->commit();
            });

        });

        return $this;

    }

    /**
     * @return $this
     */
    public function shuffleTracks() {

        $this->doAtomic(function () {

            Database::doInConnection(function (Database $db) {
                $db->executeUpdate("CALL PShuffleStream(?)", [$this->key]);
            });

            $this->optimize();

        });

        return $this;

    }

    /**
     * @param $uniqueID
     * @param $index
     * @return $this
     */
    public function moveTrack($uniqueID, $index) {

        $this->doAtomic(function () use (&$uniqueID, &$index) {

            Database::doInConnection(function (Database $db) use (&$uniqueID, &$index) {
                $db->executeUpdate("SELECT NEW_STREAM_SORT(?, ?, ?)", [$this->key, $uniqueID, $index]);
            });

        });

        return $this;

    }

    /**
     * @param $id
     * @return Optional
     */
    public function getTrackByOrder($id) {

        return $this->_getPlaylistTrack("b.t_order = ? AND b.stream_id = ?", [$id, $this->key]);

    }

    /**
     * @param $time
     * @return PlaylistTrack
     */
    public function getTrackByTime($time) {

        $mod = $time % $this->getStreamDuration();

        return $this->_getPlaylistTrack(
            "b.time_offset <= :time AND b.time_offset + a.duration >= :time AND b.stream_id = :id",
            [":time" => $mod, ":id" => $this->key]
        );

    }

    /**
     * @param callable $callable
     * @return $this
     */
    private function doAtomic(callable $callable) {

        $this->getPlayingTrack()->then(function ($track) use ($callable) {

            /** @var PlaylistTrack $track */
            $position = $this->getStreamPosition()->get();
            $trackPosition = $position - $track->getTimeOffset();

            call_user_func($callable);

            $this->_setCurrentTrack($track, $trackPosition, false);

        })->getOrElseCallback($callable);

        return $this;

    }

    /**
     * @param int|null $time
     * @return Optional
     */
    public function getPlayingTrack($time = null) {

        $position = $this->getStreamPosition($time)->getOrElseNull();

        if (is_null($position)) {
            return Optional::noValue();
        }

        return $this->getTrackByTime($position);

    }

    /**
     * @param PlaylistTrack $trackBean
     * @param int $startFrom
     * @param bool $notify
     */
    protected function _setCurrentTrack(PlaylistTrack $trackBean, $startFrom = 0, $notify = true) {

        Stream::getByID($this->key)
            ->then(function ($stream) use ($trackBean, $startFrom) {
                /** @var Stream $stream */
                $stream->setStartedFrom($trackBean->getTimeOffset() + $startFrom);
                $stream->setStarted(System::time());
                $stream->setStatus(1);
                $stream->save();
            });


        if ($notify == true) {
            $this->notifyStreamers();
        }

    }



    /**
     * @param $uniqueID
     * @return $this
     */
    public function setPlayFrom($uniqueID) {

        $this->_getPlaylistTrack("b.unique_id = ? AND b.stream_id = ?", [$uniqueID, $this->key])
            ->then(function ($track) {
                $this->_setCurrentTrack($track, 0, true);
            })->justThrow(ControllerException::noTrack($uniqueID));


        return $this;

    }

    public function generateUniqueID() {

        return Database::doInConnection(function (Database $conn) {

            do { $generated = Common::generateUniqueID(); }
            while ($conn->fetchOneColumn("SELECT COUNT(*) FROM r_link WHERE unique_id = ?", [$generated])->get());

            return $generated;

        });


    }

    public function optimize() {

        Database::doInConnection(function (Database $db) {
            $tracks = $db->fetchAll("SELECT * FROM mor_stream_tracklist_view WHERE stream_id = ?", [$this->key]);
            $timeOffset = 0;
            $orderIndex = 1;
            foreach ($tracks as $track) {
                /** @var Link $link */
                Link::getByID($track["id"])
                    ->then(function ($link) use (&$timeOffset, &$orderIndex) {
                        /** @var Link $link */
                        $link->setTimeOffset($timeOffset);
                        $link->setTrackOrder($orderIndex++);
                        $link->save();
                    });
                $timeOffset += $track["duration"];
            }
        });

        return $this;

    }



    /**
     * @param string $filter
     * @param array $args
     * @return Optional
     */
    protected function _getPlaylistTrack($filter, array $args = null) {

        return Database::doInConnection(function (Database $db) use ($filter, $args) {

            $query = $this->getTrackQueryPrefix();
            $query->limit(1);
            $query->where($filter, $args);

            return $db->fetchOneObject($query, null, "Objects\\PlaylistTrack");

        });

    }

    /**
     * @return Optional
     */
    protected function _getRandomTrack() {

        return Database::doInConnection(function (Database $db) {

            $query = $this->getTrackQueryPrefix();
            $query->orderBy("RAND()");
            $query->limit(1);
            $query->where("b.stream_id", $this->key);

            return $db->fetchOneObject($query, null, "Objects\\PlaylistTrack");

        });

    }

    /**
     * @return \MVC\Services\DB\Query\SelectQuery
     */
    private function getTrackQueryPrefix() {

        $query = DBQuery::getInstance()->selectFrom("r_tracks a")
            ->innerJoin("r_link b", "a.tid = b.track_id");

        $query->select("a.*, b.unique_id, b.t_order, b.time_offset");

        return $query;

    }

    public function notifyStreamers() {
        self::notifyAllStreamers($this->key);
    }

    public static function notifyAllStreamers($streamID) {

        $ch = curl_init("http://127.0.0.1:7778/notify?s=" . $streamID);

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_VERBOSE, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        curl_exec($ch);
        curl_close($ch);

    }

    /**
     * @return int
     */
    public function count() {
        return intval($this->tracks_count);
    }


} 