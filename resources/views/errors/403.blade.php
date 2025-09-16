@extends('errors::friendly')

@section('title', __('Access denied'))
@section('code', '403')
@section('message', __('You do not have permission to view this page.'))
@section('description', __('If you believe you should have access, please reach out to an administrator to update your role.'))
