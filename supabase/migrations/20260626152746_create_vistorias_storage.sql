-- Bucket privado para fotos das vistorias (separado do bucket "imoveis", que é público).
insert into storage.buckets (id, name, public)
values ('vistorias', 'vistorias', false)
on conflict (id) do nothing;

create policy "auth_select_vistorias_storage" on storage.objects
  for select to authenticated using (bucket_id = 'vistorias');

create policy "auth_insert_vistorias_storage" on storage.objects
  for insert to authenticated with check (bucket_id = 'vistorias');

create policy "auth_update_vistorias_storage" on storage.objects
  for update to authenticated using (bucket_id = 'vistorias');

create policy "auth_delete_vistorias_storage" on storage.objects
  for delete to authenticated using (bucket_id = 'vistorias');
