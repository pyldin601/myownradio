<?php

namespace app\Services\Storage;

use Aws\Credentials\Credentials;
use Aws\S3\S3Client;

class S3Storage extends Storage
{
    /**
     * @var S3Client
     */
    private S3Client $s3Client;

    /**
     * @var mixed
     */
    private string $bucket;


    public function __construct()
    {
        $credentials = new Credentials(
            config('services.s3.access_key'),
            config('services.s3.secret_key')
        );

        $this->s3Client = new S3Client([
            'region'            => config('services.s3.region'),
            'version'           => 'latest',
            'signature_version' => config('service.s3.signature_version'),
            'credentials'       => $credentials
        ]);

        $this->bucket = config('services.s3.bucket');

        parent::__construct(function ($key) {
            return $this->s3Client->getObjectUrl($this->bucket, $key);
        });
    }

    /**
     * @param string $key
     * @return mixed
     */
    public function get(string $key): mixed
    {
        $result = $this->s3Client->getObject([
            'Bucket'       => $this->bucket,
            'Key'          => $key,
        ]);

        return $result['Body'];
    }

    /**
     * @param string $key
     * @param mixed $body
     * @param array $parameters
     */
    public function put(string $key, $body, array $parameters = [])
    {
        $contentType = $parameters['ContentType'] ?? null;

        $this->s3Client->putObject([
            'Bucket'      => $this->bucket,
            'Key'         => $key,
            'Body'        => $body,
            'ACL'         => 'public-read',
            'ContentType' => $contentType
        ]);
    }

    /**
     * @param string $key
     */
    public function delete(string $key)
    {
        $this->s3Client->deleteObject([
            "Bucket"    => $this->bucket,
            "Key"       => $key
        ]);
    }

    /**
     * @param string $key
     * @return bool
     */
    public function exists(string $key): bool
    {
        return $this->s3Client->doesObjectExist($this->bucket, $key);
    }

}
