<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreRoomRequest;
use App\Http\Requests\Admin\UpdateRoomRequest;
use App\Models\Branch;
use App\Models\Room;
use App\Support\BranchScope;
use App\Support\Flash;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RoomController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Room::class);

        $user = $request->user();
        $branchId = $request->integer('branch_id') ?: ($user->isSuperAdmin() ? null : $user->branch_id);

        if ($branchId && ! BranchScope::allows($user, $branchId)) {
            abort(403, 'You cannot view rooms for this branch.');
        }

        $search = trim((string) $request->string('search'));
        $building = $request->string('building')->toString();
        $status = $request->string('status')->toString();

        $roomsQuery = Room::query()
            ->with('branch:id,name,code')
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->when($building !== '', fn ($q) => $q->where('building', 'like', "%{$building}%"))
            ->when($status !== '', fn ($q) => $q->where('is_active', $status === 'active'))
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('room_no', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhere('building', 'like', "%{$search}%");
                });
            })
            ->orderBy('building')
            ->orderBy('room_no');

        $rooms = $roomsQuery
            ->paginate(20)
            ->withQueryString()
            ->through(function (Room $room) {
                return [
                    'id' => $room->id,
                    'branch_id' => $room->branch_id,
                    'building' => $room->building,
                    'room_no' => $room->room_no,
                    'name' => $room->name,
                    'seats' => $room->seats,
                    'equipment' => $room->equipment,
                    'is_active' => $room->is_active,
                    'branch' => $room->branch?->only(['id', 'name', 'code']),
                ];
            });

        return Inertia::render('Admin/Rooms/Index', [
            'filters' => [
                'branch_id' => $branchId,
                'search' => $search,
                'building' => $building,
                'status' => $status,
            ],
            'rooms' => $rooms,
            'branchOptions' => $user->isSuperAdmin()
                ? Branch::query()->orderBy('name')->get(['id', 'name', 'code'])
                : null,
        ]);
    }

    public function store(StoreRoomRequest $request): RedirectResponse
    {
        $room = Room::create($request->validated());

        Flash::success('Room created successfully.');

        return redirect()->route('admin.rooms.index', array_filter([
            'branch_id' => $room->branch_id,
        ]));
    }

    public function update(UpdateRoomRequest $request, Room $room): RedirectResponse
    {
        $room->update($request->validated());

        Flash::success('Room updated successfully.');

        return redirect()->route('admin.rooms.index', array_filter([
            'branch_id' => $room->branch_id,
        ]));
    }

    public function destroy(Request $request, Room $room): RedirectResponse
    {
        $this->authorize('delete', $room);

        $room->delete();

        Flash::success('Room deleted successfully.');

        return redirect()->route('admin.rooms.index', array_filter([
            'branch_id' => $room->branch_id,
        ]));
    }
}
