<?php
//LoadTemplate.php
abstract class LoadTemplate
{
   abstract protected function checkSize();
   abstract protected function checkType();
   abstract protected function uploadFile(); 
 
    protected function templateMethod()
    {
            $this->checkSize();
            $this->checkType();
            $this->uploadFile(); 
    }
    
    protected  $fileProblem;
    protected  $fileNow;
    protected  $imgSize;
    protected  $imgType;
    protected  $sizeApproved = True;
    protected  $typeApproved = True;
}
?>