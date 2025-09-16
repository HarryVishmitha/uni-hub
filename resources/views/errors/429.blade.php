@extends('errors::friendly')

@section('title', __('Too many requests'))
@section('code', '429')
@section('message', __('We\'ve received a few too many requests from you.'))
@section('description', __('Please wait a moment before trying again. This helps us keep the service fast for everyone.'))
