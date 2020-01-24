var options = {
    rangeSelect: true,
    minDate: 0,
    multiSelect: 0,
    dateFormat: 'yyyy-mm-dd',
    altField: '#dpfield'
};

const enableDatepicker = () => {
    $("input[name='radio']").on('change', function() {
        var selected = $("input[name='radio']:checked").val();
        switch (selected) {
            case 'multiple':
                options.rangeSelect = null;
                options.multiSelect = 999;
                $('#datepicker').datepick('destroy').datepick(options);
                $('#dpfield').val('');
                break;
            case 'interval':
                options.rangeSelect = true;
                options.multiSelect = null;
                $('#datepicker').datepick('destroy').datepick(options);
                $('#dpfield').val('');
                break;
            default:
                break;
        }
    });
    $("#reset").click(function() {
        if ($("input[name='radio']:checked")) {
            $("input[name='radio']:checked").prop('checked', false);
        }
        $('#datepicker').datepick('destroy');
    });
}
$(function() {
    fetch('/widget?resource=datepicker.html').then(function(data) {
        data.text().then(function(html) {
            document.getElementById('datepicker-component').innerHTML = html;
            enableDatepicker();
        });
    });
});