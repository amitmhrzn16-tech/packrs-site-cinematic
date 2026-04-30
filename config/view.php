<?php

return [

    'paths' => [
        resource_path('views'),
    ],

    /*
    | Compiled Blade path — use storage_path() so it never resolves to false
    | when the directory was missing from the tree (realpath would fail).
    */

    'compiled' => env(
        'VIEW_COMPILED_PATH',
        storage_path('framework/views')
    ),

];
