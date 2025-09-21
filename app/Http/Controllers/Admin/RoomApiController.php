<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Support\BranchScope;
use Illuminate\Http\Request;

class RoomApiController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Room::class);

        $user = $request->user();
        $branchId = $request->integer('branch_id') ?: ($user->isSuperAdmin() ? null : $user->branch_id);

        if ($branchId && ! BranchScope::allows($user, $branchId)) {
            abort(403, 'You cannot view rooms for this branch.');
        }

        $building = trim((string) $request->string('building'));
        $search = trim((string) $request->string('q'));

        $rooms = Room::query()
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->when($building !== '', fn ($q) => $q->where('building', 'like', "%{$building}%"))
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($inner) use ($search) {
                    $inner->where('room_no', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%");
                });
            })
            ->orderBy('building')
            ->orderBy('room_no')
            ->limit(50)
            ->get(['id', 'branch_id', 'building', 'room_no', 'name', 'seats', 'equipment', 'is_active']);

        return response()->json([
            'data' => $rooms,
        ]);
    }
}
