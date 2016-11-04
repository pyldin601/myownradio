<?php
/**
 * Created by PhpStorm.
 * User: Roman
 * Date: 16.02.15
 * Time: 10:06
 */

namespace Framework\Handlers\content;


use app\Providers\S3ServiceProvider;
use Framework\Controller;
use Framework\Exceptions\ControllerException;
use Framework\FileServer\FSFile;
use Framework\Models\AuthUserModel;
use Framework\Services\Config;
use Framework\Services\HttpGet;
use Framework\View\Errors\View401Exception;
use Framework\View\Errors\View404Exception;
use Objects\Track;

class DoGetPreviewAudio implements Controller
{
    public function doGet(HttpGet $get, AuthUserModel $user)
    {
        try {
            $id = $get->getRequired("id");

            /**
             * @var Track $track
             */
            $track = Track::getByID($id)->getOrElseThrow(new View404Exception());


            if ($track->getUserID() != $user->getID()) {
                throw new View401Exception();
            }

            if ($track->getIsNew() != 0) {
                $track->setIsNew(0);
                $track->save();
            }

            if ($track->getFileId() === null) {
                throw new View404Exception();
            }

            header("Content-Type: audio/mp3");
            set_time_limit(0);

            $program = config('services.ffmpeg.preview_command');

            $hash = $track->getHash();
            $s3 = S3ServiceProvider::getInstance()->getS3Client();

            $url = $s3->getObjectUrl(config('services.s3.bucket'), FSFile::getPathByHash($hash));

            $command = sprintf($program, $track->getDuration() / 3000, escapeshellarg($url));

            $proc = popen($command, "r");
            while ($data = fread($proc, 4096)) {
                echo $data;
                flush();
            }
            pclose($proc);

        } catch (ControllerException $exception) {
            echo $exception->getMyMessage();
            http_response_code(404);
        }
    }
} 