var options = {
    rangeSelect: true,
    minDate: 0,
    multiSelect: 0,
    dateFormat: 'yyyy-mm-dd',
    altField: '#dpfield'
};
$(document).ready(function() {

    $("#reset").click(function() {
        if ($("input[name='radio']:checked")) {
            $("input[name='radio']:checked").prop('checked', false);
        }
        $('#datepicker').datepick('destroy');
    });

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

    $('#form').submit(function() {
        console.log($('#dpfield'));
        return false;
    });
});