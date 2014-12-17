<?php
/**
 * Created by PhpStorm.
 * User: Roman
 * Date: 15.12.14
 * Time: 11:49
 */

namespace Model;

use MVC\Exceptions\ControllerException;
use MVC\Services\Database;
use Tools\Common;
use Tools\Optional;
use Tools\Singleton;
use Tools\System;

class StreamTrackList extends Model {

    use Singleton;

    private $key;

    /** @var User $user */
    private $user;

    private $tracks_count;
    private $tracks_duration;

    private $status;
    private $started_from;
    private $started;


    public function __construct($id) {
        parent::__construct();
        $this->user = AuthorizedUser::getInstance();
        $this->key = $id;
        $this->reload();
    }

    /**
     * @throws ControllerException
     * @return $this
     */
    public function reload() {

        Database::doInTransaction(function (Database $db) {

            $query = $db->getDBQuery()->selectFrom("r_streams a")
                ->leftJoin("r_static_stream_vars b", "a.sid = b.stream_id")
                ->where("a.sid", $this->key)
                ->select("a.uid, a.started, a.started_from, a.status, b.tracks_count, b.tracks_duration");

            $stats = $db->fetchOneRow($query)
                ->getOrElseThrow(ControllerException::noStream($this->key));

            if (intval($stats["uid"]) !== $this->user->getId()) {
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
     * @return Optional
     */
    public function getStreamPosition() {

        if ($this->tracks_duration == 0) {
            return Optional::ofNull(0);
        }

        if ($this->status == 0) {
            return Optional::ofNull(null);
        }

        $time = System::time();

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

            Database::doInTransaction(function (Database $db)
                                      use ($tracksToAdd, $initialPosition, $initialTimeOffset) {

                foreach($tracksToAdd as $track) {

                    $trackObject = new Track($track);
                    $uniqueId = $this->generateUniqueId();

                    $query = $db->getDBQuery()->insertInto("r_link")
                        ->values([
                            "stream_id"     => $this->key,
                            "track_id"      => $trackObject->getId(),
                            "t_order"       => ++$initialPosition,
                            "unique_id"     => $uniqueId,
                            "time_offset"   => $initialTimeOffset
                        ]);

                    $db->executeInsert($query);

                    $initialTimeOffset += $trackObject->getDuration();

                }

                $db->commit();

            });


        });

        return $this;

    }

    /**
     * @param $tracks
     * @return $this
     */
    public function removeTracks($tracks) {

        $this->doAtomic(function () use (&$tracks) {

            Database::doInTransaction(function (Database $db) use ($tracks) {
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

            Database::doInTransaction(function (Database $db) {
                $db->executeUpdate("CALL PShuffleStream(?)", [$this->key]);
                $db->commit();
            });

        });

        return $this;

    }

    /**
     * @param $unique
     * @param $index
     * @return $this
     */
    public function moveTrack($unique, $index) {

        $this->doAtomic(function () use ($unique, $index) {

            Database::doInTransaction(function (Database $db) use ($unique, $index) {
                $db->executeUpdate("SELECT NEW_STREAM_SORT(?, ?, ?)", [$this->key, $unique, $index]);
                $db->commit();
            });

        });

        return $this;

    }

    /**
     * @return Optional
     */
    public function getCurrentTrack() {

        $time = $this->getStreamPosition();


        if ($time->validate()) {
            return $this->getTrackByTime($time->getRaw());
        }

        return Optional::noValue();

    }

    /**
     * @param $time
     * @return $this
     */
    public function getTrackByTime($time) {

        Database::doInTransaction(function (Database $db) use ($time) {

            $query = $db->getDBQuery()->selectFrom("r_tracks a")->leftJoin("r_link b", "a.tid = b.track_id");

            $query->select("a.*, b.unique_id, b.t_order, b.time_offset");
            $query->where("b.time_offset <= :time");
            $query->where("b.time_offset + a.duration >= :time", [":time" => $time]);
            $query->where("b.stream_id", $this->key);

            $track = $db->fetchOneRow($query)->then(function (&$track) use ($time) {
                $track['cursor'] = $time - $track['time_offset'];
            });

            return $track;

        });

//        $track = $this->db->fetchOneRow("
//
//            SELECT a.*, b.unique_id, b.t_order, b.time_offset
//            FROM r_tracks a LEFT JOIN r_link b ON a.tid = b.track_id
//            WHERE b.time_offset <= :time AND b.time_offset + a.duration >= :time AND b.stream_id = :id
//
//            ", [":time" => $time, ":id" => $this->key])
//
//            ->then(function (&$track) use ($time) {
//                $track['cursor'] = $time - $track['time_offset'];
//            });
//
//        return $track;

    }

    /**
     * @param callable $callable
     * @return $this
     */
    private function doAtomic(callable $callable) {

        $track = $this->getCurrentTrack();

        call_user_func($callable);

        $this->setCurrentTrack($track);

        return $this;

    }

    /**
     * @param Optional $track
     * @param bool $force
     * @return $this
     */
    private function setCurrentTrack(Optional $track, $force = false) {

        $track->then(function ($track) {

            Database::doInTransaction(function (Database $db) use ($track) {

                $query = "SELECT time_offset FROM r_link WHERE unique_id = ? AND stream_id = ?";

                $db->fetchOneColumn($query, [$track["unique_id"], $this->key])

                    ->then(function ($offset) use ($track, $db) {

                        $cursor = $track["cursor"];
                        //$query = "UPDATE r_streams SET started_from = :from, started = :time, status = 1 WHERE sid = :id";
                        $query = $db->getDBQuery()->updateTable("r_streams")
                            ->set("started_from", $offset + $cursor)
                            ->set("started", System::time())
                            ->set("status", 1)
                            ->where(sid, $this->key);

                        $db->executeUpdate($query);

                    });

                // TODO: Otherwise method needs to be implemented (if track not found)

                $db->commit();

            });


        });

        if ($force) {
            $this->notifyStreamers();
        }

        return $this;

    }

    /**
     * @param $uniqueID
     * @return $this
     */
    public function setPlayFrom($uniqueID) {

        $track = Database::doInTransaction(function (Database $db) use ($uniqueID) {

            $query = $db->getDBQuery()->selectFrom("r_tracks a")
                ->leftJoin("r_link b", "a.tid = b.track_id")
                ->where("b.unique_id", $uniqueID)
                ->select("b.unique_id", "b.time_offset");

            $track = $db->fetchOneRow($query)
                ->then(function (&$track) { $track["cursor"] = 0; });

            $track->justThrow(ControllerException::noTrack($uniqueID));

            return $track;

        });

        $this->setCurrentTrack($track, true);

        return $this;

    }


    public function generateUniqueId() {

        return Database::doInTransaction(function (Database $db) {

            do { $generated = Common::generateUniqueId(); }
            while ($db->fetchOneColumn("SELECT COUNT(*) FROM r_link WHERE unique_id = ?", [$generated])->getRaw());

            return $generated;

        });


    }

    private function notifyStreamers() {
        self::notifyAllStreamers($this->key);
    }

    public static function notifyAllStreamers($streamId) {
        $ch = curl_init('http://127.0.0.1:7778/notify?s=' . $streamId);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_VERBOSE, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        curl_exec($ch);
        curl_close($ch);
    }

} 