<?php


namespace App\Data\Parser;

use RuntimeException;
use Storage;

/**
 * Class AbstractParser
 *
 * @package App\Data\Parser
 */
abstract class AbstractParser
{

    /**
     * @var string
     */
    protected $inputFile;

    /**
     * Default parser constructor
     *
     * @param string $inputFile
     */
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

    /**
     * Write array to json file in the storage folder
     *
     * @param string $filename
     * @param array  $data
     */
    protected static function writeJsonFile(string $filename, array $data): void
    {
        Storage::disk('local')->put($filename, json_encode($data));
    }

    /**
     * Write array to tsv file in the storage folder
     *
     * @param string     $filename
     * @param array      $data
     * @param array|null $header
     */
    protected static function writeTSV(string $filename, array $data, ?array $header = null): void
    {
        $data = implode(
            PHP_EOL,
            array_map(
                function ($x) {
                    return implode("\t", $x);
                },
                $data
            )
        );
        if ($header !== null) {
            $data = implode("\t", $header) . PHP_EOL . $data;
        }
        Storage::disk('local')->put($filename, $data);
    }

    /**
     * Write array to PHP data file in storage folder
     *
     * @param string $filename
     * @param array  $data
     */
    protected static function writePhpFile(string $filename, array $data): void
    {
        $content = "return " . var_export($data, true) . ";";
        Storage::disk('local')->put($filename, $content);
    }

    /**
     * @param string        $data
     * @param mixed         $repl
     * @param null|callable $conv
     *
     * @return mixed|string
     */
    protected static function handleNA(string $data, $repl = NAN, $conv = null)
    {
        if ($data == "NA" || $data == "na") {
            return $repl;
        } else {
            if ($conv !== null && is_callable($conv)) {
                return call_user_func($conv, $data);
            } else {
                return $data;
            }
        }
    }


}
