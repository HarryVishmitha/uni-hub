@extends('errors::friendly')

@section('title', __('Page expired'))
@section('code', '419')
@section('message', __('Your session has expired.'))
@section('description', __('Refresh the page and try again. If you were filling out a form, please sign in again before resubmitting.'))
