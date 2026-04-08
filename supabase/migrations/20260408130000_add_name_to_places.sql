-- ============================================
-- Migration: Add name to places
-- Purpose: 店舗名（name）をplacesテーブルに追加
-- ============================================

alter table public.places add column name varchar(255);
