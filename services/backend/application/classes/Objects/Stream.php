<?php
/**
 * Created by PhpStorm.
 * UserModel: Roman
 * Date: 18.12.14
 * Time: 12:09
 */

namespace Objects;

use Framework\Services\ORM\EntityUtils\ActiveRecord;
use Framework\Services\ORM\EntityUtils\ActiveRecordObject;
use Tools\Folders;

/**
 * Class StreamAR
 * @package Model\ActiveRecords
 * @table r_streams
 * @key sid
 *
 * @do_SEARCH_BY_HASHTAGS MATCH(hashtags) AGAINST(? IN BOOLEAN MODE)
 * @do_SEARCH_BY_ANYTHING MATCH(name, permalink, hashtags) AGAINST (? IN BOOLEAN MODE)
 * @do_FIND_SIMILAR sid != :id AND permalink != :id AND status = 1 AND MATCH(hashtags) AGAINST((SELECT hashtags FROM r_streams WHERE (sid = :id) OR (permalink = :id)))
 * @do_GET_BY_KEY (sid = :key) OR (permalink IS NOT NULL AND permalink = :key)
 */
class Stream extends ActiveRecordObject implements ActiveRecord
{

    protected $sid,
        $uid,
        $name,
        $permalink,
        $info,
        $status = 0,
        $started,
        $started_from,
        $access = "PUBLIC",
        $category,
        $hashtags,
        $cover,
        $cover_background,
        $created;

    /**
     * @param User $user
     * @return bool
     */
    public function isAccessibleTo(User $user)
    {
        return $user->isSuperUser() || $user->getID() == $this->getUserID();
    }

    /**
     * @param $access
     * @return $this
     */
    public function setAccess($access)
    {
        $this->access = $access;
        return $this;
    }

    /**
     * @return string
     */
    public function getAccess()
    {
        return $this->access;
    }

    /**
     * @param mixed $category
     * @return $this
     */
    public function setCategory($category)
    {
        $this->category = $category;
        return $this;
    }

    /**
     * @return int
     */
    public function getCategory()
    {
        return intval($this->category);
    }

    /**
     * @param string $cover
     * @return $this
     */
    public function setCover($cover)
    {
        $this->cover = $cover;
        return $this;
    }

    /**
     * @return string
     */
    public function getCover()
    {
        return $this->cover;
    }

    /**
     * @param int $created
     * @return $this
     */
    public function setCreated($created)
    {
        $this->created = $created;
        return $this;
    }

    /**
     * @return int
     */
    public function getCreated()
    {
        return intval($this->created);
    }

    /**
     * @param string $hashtags
     * @return $this
     */
    public function setHashTags($hashtags)
    {
        $this->hashtags = $hashtags;
        return $this;
    }

    /**
     * @return string
     */
    public function getHashTags()
    {
        return $this->hashtags;
    }

    /**
     * @return string[]
     */
    public function getHashTagsArray()
    {
        return preg_split("~\\s*,\\s*~", $this->hashtags);
    }

    /**
     * @param string $info
     * @return $this
     */
    public function setInfo($info)
    {
        $this->info = $info;
        return $this;
    }

    /**
     * @return string
     */
    public function getInfo()
    {
        return $this->info;
    }

    /**
     * @param string $name
     * @return $this
     */
    public function setName($name)
    {
        $this->name = $name;
        return $this;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @param string|null $permalink
     * @return $this
     */
    public function setPermalink($permalink)
    {
        $this->permalink = $permalink;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getPermalink()
    {
        return $this->permalink;
    }

    /**
     * @return int
     */
    public function getID()
    {
        return intval($this->sid);
    }

    /**
     * @param int $started
     * @return $this
     */
    public function setStarted($started)
    {
        $this->started = $started;
        return $this;
    }

    /**
     * @return int
     */
    public function getStarted()
    {
        return intval($this->started);
    }

    /**
     * @param int $started_from
     * @return $this
     */
    public function setStartedFrom($started_from)
    {
        $this->started_from = $started_from;
        return $this;
    }

    /**
     * @return int
     */
    public function getStartedFrom()
    {
        return intval($this->started_from);
    }

    /**
     * @param int $status
     * @return $this
     */
    public function setStatus($status)
    {
        $this->status = $status;
        return $this;
    }

    /**
     * @return int
     */
    public function getStatus()
    {
        return intval($this->status);
    }

    /**
     * @return int
     */
    public function getUserID()
    {
        return $this->uid;
    }

    /**
     * @param $uid
     * @return $this
     */
    public function setUserID($uid)
    {
        $this->uid = $uid;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getKey()
    {
        return isset($this->permalink) ? $this->permalink : $this->sid;
    }

    /**
     * @return User
     */
//    public function getUser() {
//        return User::getByID($this->getUserID())->get();
//    }

    /**
     * @return null|string
     */
    public function getCoverUrl()
    {
        return Folders::getInstance()->genStreamCoverUrl($this->cover);
    }

    public function getStreamUrl()
    {
        return Folders::getInstance()->genStreamUrl($this->sid);
    }

    /**
     * @param mixed $cover_background
     */
    public function setCoverBackground($cover_background)
    {
        $this->cover_background = $cover_background;
    }

    /**
     * @return mixed
     */
    public function getCoverBackground()
    {
        return $this->cover_background;
    }
}
