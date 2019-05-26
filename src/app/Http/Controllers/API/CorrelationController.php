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
use Illuminate\Support\Str;
use RuntimeException;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\Process\Process;

/**
 * Class CorrelationController
 * @package App\Http\Controllers\API
 */
class CorrelationController extends Controller
{

    public function index(): JsonResponse
    {
        $error = false;
        $message = '';
        $data = null;
        try {
            $data = CachedReader::json(Common::CORRELATION_DATASETS);
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

    public function showDataset(string $correlation, string $dataset): JsonResponse
    {
        $error = false;
        $message = '';
        $data = null;
        try {
            if (empty($correlation)) {
                throw new RuntimeException("Empty correlation measure");
            }
            if (empty($dataset)) {
                throw new RuntimeException("Empty dataset identifier");
            }
            $data = CachedReader::json(sprintf(Common::CORRELATION_DATASET_BASE, $correlation, $dataset));
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

    public function showGraph(Request $request, string $correlation, string $dataset): JsonResponse
    {
        $error = false;
        $message = '';
        $data = null;
        try {
            if (empty($correlation)) {
                throw new RuntimeException("Empty correlation measure");
            }
            if (empty($dataset)) {
                throw new RuntimeException("Empty dataset identifier");
            }
            $datasets = CachedReader::json(Common::CORRELATION_DATASETS);
            if (!isset($datasets["datasetsByMeasure"][$correlation][$dataset])) {
                throw new RuntimeException("Unknown dataset");
            }
            $datasetFilename = resource_path('data/datasets/' . $dataset . '.rds');
            if (!file_exists($datasetFilename)) {
                throw new RuntimeException("Unable to find dataset filename");
            }
            $NCI60Dataset = resource_path('data/datasets/NCI60.rds');
            $row = $request->get('row');
            $col = $request->get('col');
            if (empty($row)) {
                throw new RuntimeException("Row parameter is required");
            }
            if (empty($col)) {
                throw new RuntimeException("Col parameter is required");
            }
            $bin = resource_path('bin/corr.graph.R');
            if (!file_exists(storage_path('app/public/graphs/'))) {
                mkdir(storage_path('app/public/graphs'), 0777, true);
            }
            $id = 'corr_graph_' . md5($correlation . $dataset . $row . $col);
            $outputFile = storage_path('app/public/graphs/' . $id . '.html');
            if (!file_exists($outputFile)) {
                $process = new Process(
                    [
                        'Rscript',
                        $bin,
                        '-r',
                        $row,
                        '-c',
                        $col,
                        '-d',
                        $datasetFilename,
                        '-t',
                        $NCI60Dataset,
                        '-m',
                        $correlation,
                        '-o',
                        $outputFile,
                    ]
                );
                $process->run();
                $exitCode = $process->getExitCode();
                switch ($exitCode) {
                    case 1:
                        throw new RuntimeException($process->getErrorOutput());
                        break;
                    case 101:
                        throw new RuntimeException("Invalid input dataset {$datasetFilename}");
                        break;
                    case 102:
                        throw new RuntimeException("Invalid input tRF dataset {$NCI60Dataset}");
                        break;
                    case 103:
                        throw new RuntimeException("Invalid row identifier {$row}");
                        break;
                    case 104:
                        throw new RuntimeException("Invalid column identifier {$col}");
                        break;
                    case 105:
                        throw new RuntimeException("Error during execution: " . $process->getOutput());
                        break;
                    case 0:
                        break;
                    default:
                        throw new RuntimeException("Unknown error - Exit Code {$exitCode}");
                        break;
                }
            }
            $data = url('/storage/graphs/' . $id . '.html');
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

    public function downloadDataset(string $correlation, string $dataset, string $type): BinaryFileResponse
    {
        try {
            if (empty($correlation)) {
                throw new RuntimeException("Empty correlation measure");
            }
            if (empty($dataset)) {
                throw new RuntimeException("Empty dataset identifier");
            }
            $datasets = CachedReader::json(Common::CORRELATION_DATASETS);
            $datasetName = Str::kebab($datasets['datasetsByMeasure'][$correlation][$dataset]);
            if ($type == "table") {
                $file = resource_path(sprintf(Common::CORRELATION_INPUT_BASE, $correlation, $dataset));
                $name = $correlation . '-' . $datasetName . '.tsv.gz';
            } elseif ($type == "data") {
                $file = resource_path(sprintf(Common::CORRELATION_INPUT_DATA, $dataset));
                $name = $datasetName . '.rds';
            } else {
                throw new RuntimeException("Unsupported type.");
            }

            return response()->download($file, $name);
        } catch (Exception $e) {
            $message = 'Exception ' . get_class($e) . ': ' . $e->getMessage();
        } catch (Error $e) {
            $message = 'Error ' . get_class($e) . ': ' . $e->getMessage();
        }

        abort(500, $message);
    }
}
