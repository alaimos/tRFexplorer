<?php


namespace App\Data\Parser;

use RuntimeException;
use Storage;

abstract class AbstractParser
{

    protected $inputFile;

    public function __construct(string $inputFile)
    {
        if (!file_exists($inputFile)) {
            throw new RuntimeException("Input file does not exist");
        }
        $this->inputFile = $inputFile;
    }

    /**
     * Run this parser
     */
    public abstract function run(): void;

    protected static function writeJsonFile(string $filename, array $data): void
    {
        Storage::disk('local')->put($filename, json_encode($data));
    }


}
