@extends('errors::friendly')

@section('title', __('Service temporarily unavailable'))
@section('code', '503')
@section('message', __('We\'re getting things ready and will be back shortly.'))
@section('description', __('Our maintenance window usually lasts only a few minutes. Thanks for your patience!'))
