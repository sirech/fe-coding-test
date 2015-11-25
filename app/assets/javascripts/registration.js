$(function() {
	$("#registration-form").on("submit", function(event) {
		setTimeout(function() {
			this.submit();
		}, 50);
		event.preventDefault();
	});
});