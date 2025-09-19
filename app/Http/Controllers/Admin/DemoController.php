<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\Flash;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DemoController extends Controller
{
    /**
     * Show a demo page for testing features.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        return Inertia::render('Admin/Demo/Index');
    }
    
    /**
     * Demonstrate the alert system with a backend flash message.
     *
     * @param  Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function flashAlert(Request $request)
    {
        $type = $request->input('type', 'info');
        $message = $request->input('message', 'This is a flash message from the backend.');
        
        switch ($type) {
            case 'success':
                Flash::success($message);
                break;
            case 'error':
                Flash::error($message);
                break;
            case 'warning':
                Flash::warning($message);
                break;
            default:
                Flash::info($message);
        }
        
        return redirect()->back();
    }
}