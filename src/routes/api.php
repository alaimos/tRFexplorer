<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::namespace('API')->group(
    function () {
        Route::get('/browseByExpression', 'BrowseByExpression@formData');
        Route::get('/browseByExpression/types', 'BrowseByExpression@types');
        Route::post('/browseByExpression', 'BrowseByExpression@search');
        Route::get('/fragments/{fragment}', 'FragmentController@show');
        Route::get('/data/download/{dataset}', 'DataController@download');
        Route::get('/data/clinical', 'DataController@clinical');
        Route::get('/data/clinical/de', 'DataController@deClinical');
        Route::post('/de/analysis', 'DEController@runAnalysis');
        Route::get('/de/{id}', 'DEController@show');
        Route::get('/de/{id}/download/summary', 'DEController@downloadSummary');
        Route::get('/de/{id}/download/{contrast}', 'DEController@download');
        Route::get('/correlation', 'CorrelationController@index');
        Route::get('/correlation/{correlation}/dataset/{dataset}', 'CorrelationController@showDataset');
        Route::post('/correlation/{correlation}/dataset/{dataset}/graph', 'CorrelationController@showGraph');
        Route::get(
            '/correlation/{correlation}/dataset/{dataset}/download/{type}',
            'CorrelationController@downloadDataset'
        );
    }
);

/*Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});*/
