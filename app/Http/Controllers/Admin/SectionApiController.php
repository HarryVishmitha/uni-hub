<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Section;
use App\Support\Timetable\ConflictChecker;
use App\Support\Timetable\IcsExporter;
use Illuminate\Http\Request;

class SectionApiController extends Controller
{
    public function conflicts(Request $request, Section $section, ConflictChecker $conflictChecker)
    {
        $this->authorize('view', $section);

        $section->loadMissing('term.branch', 'course.orgUnit', 'meetings.room', 'appointments.user');

        return response()->json($conflictChecker->matrix($section));
    }

    public function ics(Request $request, Section $section, IcsExporter $exporter)
    {
        $this->authorize('view', $section);

        $ics = $exporter->exportSection($section);

        $courseCode = $section->course?->code ?? 'section';
        $sectionCode = $section->section_code ?? $section->id;
        $fileName = sprintf('%s-%s.ics', $courseCode, $sectionCode);

        return response($ics, 200, [
            'Content-Type' => 'text/calendar; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="'.$fileName.'"',
        ]);
    }
}
