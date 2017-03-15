<?php
function callback($arch){
return filemtime($arch);
}
chdir('../tracks'); 
$vec2=glob('*.mp3');
$vec1=array_map('callback',$vec2);
$vec=array_combine($vec2,$vec1);
asort($vec);
$vec=array_keys($vec);
foreach($vec as $v)echo "$v.%"; 
?>