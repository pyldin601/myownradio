<?php

namespace Tools;

use app\Config\Config;
use Framework\Injector\Injectable;
use Objects\Track;
use Objects\User;

class Folders implements Injectable, SingletonInterface {

    use Singleton;

    /* Common constants */
    const MOR_REST_DOMAIN = "https://radioter.io";
    // @todo Check and ge rid of
    const MOR_HEAP_FOLDER = "/var/apps/myownradio.biz/storage/legacy/heap";
    // @todo Check and ge rid of
    const MOR_CONTENT_FOLDER = "/var/apps/myownradio.biz/storage/legacy/content";

    /* Specific constants: URL */
    const MOR_URL_STREAM_COVERS = "%s/content/streamcovers/%s";
    const MOR_URL_USER_AVATARS = "%s/content/avatars/%s";

    /* Specific constants: PATH */
    const MOR_DIR_STREAM_COVERS = "%s/streamcovers/%s";
    const MOR_DIR_USER_AVATARS = "%s/avatars/%s";
    const MOR_DIR_CACHE_LOCATION = "%s/%s/%s/%s.%s";

    /**
     * @param mixed $data
     * @param File $file
     * @return File
     */
    public function generateCacheFile($data, File $file)
    {
        $data = serialize($data);
        $md5 = md5($data);
        return new File(sprintf(
            self::MOR_DIR_CACHE_LOCATION,
            config('storage.cache_dir'),
            $md5[0],
            $md5[1],
            $md5,
            $file->extension()
        ));
    }

    /**
     * @param mixed $data
     * @param string $extension
     * @return string
     */
    public function generateCacheFile2($data, $extension)
    {
        $data = serialize($data);
        $md5 = md5($data);
        return sprintf(
            self::MOR_DIR_CACHE_LOCATION,
            'cache',
            $md5[0],
            $md5[1],
            $md5,
            $extension
        );
    }

    /* Url generators */
    function genStreamCoverUrl($filename) {
        if ($filename === null) return null;
        return sprintf(self::MOR_URL_STREAM_COVERS, self::MOR_REST_DOMAIN, $filename);
    }

    function genAvatarUrl($filename) {
        if ($filename === null) return null;
        return sprintf(self::MOR_URL_USER_AVATARS, self::MOR_REST_DOMAIN, $filename);
    }

    /* Dir generators */
    public function genStreamCoverPath($filename)
    {
        if ($filename === null) {
            return null;
        }
        return config('storage.images.covers_path') . DIRECTORY_SEPARATOR . $filename;
    }

    /**
     * @param $filename
     * @return null|string
     */
    public function genAvatarPath($filename)
    {
        if ($filename === null) {
            return null;
        }
        return config('storage.images.avatars_path') . DIRECTORY_SEPARATOR . $filename;
    }

    /**
     * @param int $uid
     * @return string
     */
    function getUserContentFolder($uid) {
        return sprintf("%s/ui_%d", self::MOR_CONTENT_FOLDER, $uid);
    }

    function generateUserContentFolder(User $user) {
        return sprintf("%s/ui_%d", self::MOR_CONTENT_FOLDER, $user->getID());
    }

    // @todo Check and get rid
    function genStreamUrl($id) {
        return sprintf("http://stream1.radioter.io:7778/audio?s=%d", $id);
    }

    // @todo Check and get rid
    function genStreamPageUrl($id) {
        return sprintf("//radioter.io/streams/%s", $id["key"]);
    }


}
