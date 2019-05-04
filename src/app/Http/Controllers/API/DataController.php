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
}
