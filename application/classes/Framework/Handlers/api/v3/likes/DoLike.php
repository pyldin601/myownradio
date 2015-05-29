<?php
/**
 * Created by PhpStorm.
 * User: Roman
 * Date: 10.04.15
 * Time: 9:49
 */

namespace Framework\Handlers\api\v3\likes;


use API\REST\TrackCollection;
use Framework\ControllerImpl;
use Framework\Exceptions\ControllerException;
use Framework\Exceptions\DatabaseException;
use Framework\Models\AuthUserModel;
use Framework\Services\DB\DBQuery;
use Framework\Services\HttpPost;
use Framework\Services\JsonResponse;
use Framework\Services\Locale\I18n;
use Framework\Services\Notifier;

class DoLike extends ControllerImpl {
    public function doPost(HttpPost $post, JsonResponse $response,
                           DBQuery $dbq, AuthUserModel $userModel,
                           TrackCollection $trackCollection, Notifier $notifier) {
        $track_id = $post->getRequired("track_id", FILTER_VALIDATE_INT);
        $query = $dbq->into("mor_track_like");
        $query->values("user_id", $userModel->getID());
        $query->values("track_id", $track_id);
        $query->values("relation", "like");
        try {
            $query->executeInsert();
        } catch (DatabaseException $ex) {
            throw ControllerException::of(I18n::tr("YOU_ALREADY_VOTED"));
        }
        $track = $trackCollection->getSingleTrack($track_id);
        $response->setData($track);

        $notifier->shout("track_" . $track_id, "like", $track["likes"]);

    }
} 