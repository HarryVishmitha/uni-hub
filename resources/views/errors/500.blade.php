@extends('errors::friendly')

@section('title', __('Server error'))
@section('code', '500')
@section('message', __('Something unexpected happened on our side.'))
@section('description', __('We are looking into it right away. Please try again in a moment or contact us if the issue continues.'))
