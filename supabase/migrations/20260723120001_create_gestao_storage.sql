-- Bucket privado para documentos e fotos da gestão (contratos, docs de imóveis
-- e inquilinos, fotos de manutenção). Acesso somente por URL assinada.
insert into storage.buckets (id, name, public)
values ('gestao', 'gestao', false)
on conflict (id) do nothing;

create policy "auth_select_gestao_storage" on storage.objects
  for select to authenticated using (bucket_id = 'gestao');

create policy "auth_insert_gestao_storage" on storage.objects
  for insert to authenticated with check (bucket_id = 'gestao');

create policy "auth_update_gestao_storage" on storage.objects
  for update to authenticated using (bucket_id = 'gestao');

create policy "auth_delete_gestao_storage" on storage.objects
  for delete to authenticated using (bucket_id = 'gestao');
