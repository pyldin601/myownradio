<?php

namespace app\Services\Storage;

abstract class Storage implements StorageInterface
{
    /**
     * @var callable|null
     */
    private $urlMapper;

    /**
     * @param callable|null $urlMapper
     */
    public function __construct(callable $urlMapper = null)
    {
        $this->urlMapper = $urlMapper;
    }

    /**
     * @param string $key
     * @return mixed
     * @throws StorageException
     */
    public function url(string $key)
    {
        if (is_null($this->urlMapper)) {
            throw new StorageException("Url mapper not configured");
        }
        return call_user_func($this->urlMapper, $key);
    }
}
