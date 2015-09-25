queue()
    .defer(d3.json, "datafiles/briarwood/races.json")
    .await(ready);
		 
		 
function ready(error, races) {
	if (error) throw error;

	for (i = 0; i < races.length; i++){
		var x = "." + races[i].name + "-details";
		d3.select(x).html(races[i].description);
	}			
	
}
