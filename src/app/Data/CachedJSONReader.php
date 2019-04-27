<?php


namespace App\Data;


use Cache;

class CachedJSONReader
{

    /**
     * Read a json file
     *
     * @param string $filename
     * @param string|null $disk
     * @param bool $force
     * @return array
     * @throws \Illuminate\Contracts\Filesystem\FileNotFoundException
     */
    public static function read(string $filename, ?string $disk = 'local', bool $force = false): array
    {
        $id = $disk . '://' . $filename;
        if (!$force && Cache::has($id)) {
            return Cache::get($id);
        } else {
            $data = json_decode(\Storage::disk($disk)->get($filename), true);
            Cache::put($id, $data, 6000);
            return $data;
        }
    }

}