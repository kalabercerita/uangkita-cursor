@echo off
echo Deploying analyze-receipt function to Supabase...
call npx supabase functions deploy analyze-receipt --project-ref jvdmtxoumqfpsejbdorr
if %ERRORLEVEL% EQU 0 (
    echo Function deployed successfully!
) else (
    echo Failed to deploy function. Please check the error message above.
)
pause 