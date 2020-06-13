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


