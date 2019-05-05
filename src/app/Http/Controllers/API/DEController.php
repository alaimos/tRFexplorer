<?php

namespace App\Http\Controllers\API;

use Cache;
use Error;
use Exception;
use App\Data\Common;
use Illuminate\Support\Arr;
use Illuminate\Http\Request;
use App\Data\CachedReader;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use RuntimeException;
use Storage;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

/**
 * Class DEController
 * @package App\Http\Controllers\API
 */
class DEController extends Controller
{

    /**
     * Run DE Analysis
     *
     * @param \Illuminate\Http\Request $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function runAnalysis(Request $request): JsonResponse
    {
        $error = false;
        $message = '';
        $data = null;
        try {
            $dataset = $request->get('dataset');
            $variables = (array)$request->get('variables', []);
            $contrasts = (array)$request->get('contrasts', []);
            $maxP = (double)$request->get('maxP', 0.01);
            $minLFC = (double)$request->get('minLFC', 1);
            $datasetExists = Storage::disk('local')->exists(Common::TCGA_CLINICAL_DE_FOLDER . '/' . $dataset . '.tsv');
            if (empty($dataset) || !$datasetExists) {
                throw new RuntimeException("Invalid dataset {$dataset}.");
            }
            if (empty($variables)) {
                throw new RuntimeException("No variables specified");
            }
            if (empty($contrasts)) {
                throw new RuntimeException("No contrasts specified");
            }
            $id = md5(json_encode([$data, $variables, $contrasts]));
            $folderBase = sprintf(Common::OUTPUT_BASE, $id);
            $analysisFolder = storage_path('app/' . $folderBase);
            $resultFile = $analysisFolder . '/results.json';
            if (file_exists($resultFile)) {
                $data = CachedReader::json($folderBase . '/results.json');
            } else {
                mkdir($analysisFolder, 0777, true);
                $inputData = storage_path('app/' . Common::TCGA_EXPRESSION_DE_FOLDER . '/' . $dataset . '.tsv');
                $inputClinical = storage_path('app/' . Common::TCGA_CLINICAL_DE_FOLDER . '/' . $dataset . '.tsv');
                $configFile = $analysisFolder . '/config.json';
                file_put_contents(
                    $configFile,
                    json_encode(
                        [
                            "variables" => $variables,
                            "maxP"      => $maxP,
                            "minLFC"    => $minLFC,
                            "contrasts" => $contrasts,
                        ]
                    )
                );
                $bin = resource_path('bin/de.analysis.R');
                $process = new Process(
                    [
                        'Rscript',
                        $bin,
                        '-d',
                        $inputData,
                        '-c',
                        $inputClinical,
                        '-a',
                        $configFile,
                        '-o',
                        $analysisFolder . '/',
                    ]
                );
                $process->run();
                $exitCode = $process->getExitCode();
                switch ($exitCode) {
                    case 101:
                        throw new RuntimeException("Invalid input data file {$inputData}");
                        break;
                    case 102:
                        throw new RuntimeException("Invalid input clinical file {$inputClinical}");
                        break;
                    case 103:
                        throw new RuntimeException("Invalid config file {$configFile}");
                        break;
                    case 104:
                        throw new RuntimeException("Invalid output folder {$analysisFolder}");
                        break;
                    case 105:
                        throw new RuntimeException("Error during execution: " . $process->getOutput());
                        break;
                }
                $deFiles = [];
                $deUrls = [];
                for ($i = 0; $i < count($contrasts); $i++) {
                    $deFiles[] = $analysisFolder . '/de.coef-' . ($i + 1) . '.tsv';
                    $deUrls[] = url(sprintf(Common::OUTPUT_URL_BASE, $id, $i + 1));
                }
                $data = [
                    'id'       => $id,
                    'deFiles'  => $deFiles,
                    'deUrls'   => $deUrls,
                    'deStatus' => $analysisFolder . '/de.status.tsv',
                ];
                file_put_contents($resultFile, json_encode($data));
            }
        } catch (Exception $e) {
            $error = true;
            $message = 'Exception ' . get_class($e) . ': ' . $e->getMessage();
        } catch (Error $e) {
            $error = true;
            $message = 'Error ' . get_class($e) . ': ' . $e->getMessage();
        }

        return response()->json(
            [
                'error'   => $error,
                'message' => $message,
                'data'    => $data,
            ]
        );
    }

}
