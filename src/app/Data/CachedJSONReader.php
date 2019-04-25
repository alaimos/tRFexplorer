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
     * @return array
     * @throws \Illuminate\Contracts\Filesystem\FileNotFoundException
     */
    public static function read(string $filename, ?string $disk = 'local'): array
    {
        $id = $disk . '://' . $filename;
        if (Cache::has($id)) {
            return Cache::get($id);
        } else {
            $data = json_decode(\Storage::disk($disk)->get($filename), true);
            Cache::put($id, $data, 6000);
            return $data;
        }
    }

}