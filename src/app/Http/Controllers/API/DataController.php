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
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * Class DataController
 * @package App\Http\Controllers\API
 */
class DataController extends Controller
{

    /**
     * Show TCGA and NCI60 clinical data
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function clinical(): JsonResponse
    {
        $error = false;
        $message = '';
        $data = null;
        try {
            $data = [
                'NCI60' => CachedReader::json(Common::NCI60_CLINICAL),
                'TCGA'  => CachedReader::json(Common::TCGA_CLINICAL),
            ];
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

    /**
     * Shows TCGA clinical data for D.E. Analysis
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function deClinical(): JsonResponse
    {
        $error = false;
        $message = '';
        $data = null;
        try {
            $data = CachedReader::json(Common::TCGA_CLINICAL_DE_BY_DATASET);
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

    /**
     * @param string $dataset
     *
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    public function download(string $dataset): BinaryFileResponse
    {
        $file = null;
        switch ($dataset) {
            case 'NCI60_RPM_matrix.tsv.gz':
            case 'NCI60_TPM_matrix.tsv.gz':
            case 'TCGA_RPM_matrix.tsv.gz':
            case 'TCGA_TPM_matrix.tsv.gz':
            case 'tRNA.fragments.hg19.tsv.gz':
                $file = realpath(resource_path('/data/' . $dataset));
                break;
            default:
                abort(404, 'Dataset not found');
        }

        return response()->download($file);
    }
}
