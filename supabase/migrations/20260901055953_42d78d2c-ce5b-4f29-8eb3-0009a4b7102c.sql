REVOKE EXECUTE ON FUNCTION public.keep_backend_awake() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.keep_backend_awake() TO postgres, service_role;