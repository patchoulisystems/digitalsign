# digitalsign
digital signage app built on nodejs

## start script
there is a sample_start.sh included in master  
the following settings can be controlled in the start script
1. HOSTNAME - the address to listen on. can put 0.0.0.0 (default) to listen on all addresses   
more than likely you will put the address of the interface you want to listen on
2. PORT - port to listen on (default 8080)
3. PFX - path to your .pfx file here - if the path is invalid the server will create an http server instead
4. SECRET - passphrase for your .pfx file if you have one, recommend single quotes for bash to ignore escape characters


## Administration (WIP)
This consists of 3 seperate functions
1. Image handling
    1. We need an image management page, with upload/delete/edit images 
3. Creating Slideshows
    1. We need a slideshow management page (preferably with preview), to allow for create/delete/edit slideshow
    2. Slideshow creation should allow us to select a sequence of images, (drag and drop would be nice)
    3. Each slideshow *should* be able to have its own properties, such as interval, animation, etc
4. Assigning slideshows to dates
    1. This page should show a datepicker and a list of slideshows created by the user (ideally with preview)
    2. There should be a default slideshow that will show if that date has nothing 
