var autoSave;

function CreateAutoSaveEvents()
{
    if (objSettings.Values.UseAutoSave) {
        $(document).on('focus', '[role="textbox"]', function()
        {            
            if ($(this).closest('.Kf').length===0 && $(this).text().length === 0)
            {
                var id = $(this).closest('[jsmodel="mrYqlc"]').attr("id");
                var storageName = 'autosave.' + id;
                var autoSave = JSON.parse(localStorage.getItem(storageName));
                if (autoSave !== null) {
                    $(this).text(autoSave.content);
                }
            }
            $(this).closest('.Pf').parent().parent().find('[role="button"]').click(function() {
                // Beliebiger Buttonklick führt zum löschen des Autosave-Textes
                localStorage.removeItem(storageName);
            });
            $(this).closest('[guidedhelpid="sharebox"]').find('[role="button"]').click(function() {
                localStorage.removeItem(storageName);
            });
        });

        $(document).on('input', '[role="textbox"]', function()
        {
            if ($(this).closest('.Pf').length > 0)
            {
                // Kommentar
                var id = $(this).closest('[jsmodel="mrYqlc"]').attr("id");
                var storageName = 'autosave.' + id;

                if ($(this).text().length > 3)
                {
                    // Autosave
                    var autoSave = {id: id, date: Date(), content: $(this).text()};
                    localStorage.setItem(storageName, JSON.stringify(autoSave));
                } else if ($(this).text().length === 0) {
                    // Laden, falls AutoSave vorhanden:

                }
            }
        }
        );
    }
}