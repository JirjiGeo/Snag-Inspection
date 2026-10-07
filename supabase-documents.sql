insert into storage.buckets (id, name, public, file_size_limit)
values ('snag-documents', 'snag-documents', false, 20971520)
on conflict (id) do update
set public = false, file_size_limit = excluded.file_size_limit;

drop policy if exists "Owners can read snag documents" on storage.objects;
drop policy if exists "Owners can upload snag documents" on storage.objects;
drop policy if exists "Owners can update snag documents" on storage.objects;
drop policy if exists "Private snag document reads" on storage.objects;
drop policy if exists "Private snag document uploads" on storage.objects;
drop policy if exists "Private snag document updates" on storage.objects;
drop policy if exists "Private snag document deletes" on storage.objects;

create policy "Owners can read snag documents"
on storage.objects for select to authenticated
using (bucket_id = 'snag-documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Owners can upload snag documents"
on storage.objects for insert to authenticated
with check (bucket_id = 'snag-documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Owners can update snag documents"
on storage.objects for update to authenticated
using (bucket_id = 'snag-documents' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'snag-documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Private snag document reads"
on storage.objects as restrictive for select to public
using (bucket_id <> 'snag-documents' or (storage.foldername(name))[1] = auth.uid()::text);

create policy "Private snag document uploads"
on storage.objects as restrictive for insert to public
with check (bucket_id <> 'snag-documents' or (storage.foldername(name))[1] = auth.uid()::text);

create policy "Private snag document updates"
on storage.objects as restrictive for update to public
using (bucket_id <> 'snag-documents' or (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id <> 'snag-documents' or (storage.foldername(name))[1] = auth.uid()::text);

create policy "Private snag document deletes"
on storage.objects as restrictive for delete to public
using (bucket_id <> 'snag-documents' or (storage.foldername(name))[1] = auth.uid()::text);