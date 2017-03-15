<?php
//Upload.php
include_once('LoadTemplate.php');
class Upload extends LoadTemplate
{
    const FILEMAX=100000000;
    
    public function __construct()
    {        
        if ($_FILES['file']['error'] == 0)
        {
            $this->fileNow=$_FILES["file"]["name"];
            $this->templateMethod();
        }
        else
        {
            echo $this->fileError($_FILES['file']['error']);
        }
    }
    protected function checkSize()
    {
         $this->imgSize=$_FILES["file"]["size"];
         if($this->imgSize > self::FILEMAX)
         {
            $this->sizeApproved = False;
         }
    }
    
    protected function checkType()
    {
    /*
		$this->imgType=$_FILES["file"]["type"];
         switch($this->imgType)
         {
            case "image/png":
                break;
            case "image/jpeg":
                break;
            case "image/gif":
                break;
            case "image/svg+xml":
                break;
            default:
                $this->typeApproved=False;
                break;
         }
    */
	}
    
    protected function uploadFile()
    {
         if($this->sizeApproved && $this->typeApproved)
         {
            move_uploaded_file($_FILES["file"]["tmp_name"],"Z2.0/tracks/$this->fileNow"); 
            echo "The file $this->fileNow has been uploaded to the images folder:<br />";
         }
         elseif(! $this->sizeApproved)
         {
                echo "Your file was too big.<br />It must be less than 1mb.";
        }
        elseif(! $this->typeApproved)
        {
                echo "Your file type cannot be loaded into a Web page.<br />It must be a jpg, png, gif, or svg file.";
        }
        
    }
    
    private function fileError($error)
    {
        $errorNow = $error;
        switch($errorNow)
        {
            case 1:
                $this->fileProblem= "UPLOAD_ERR_INI_SIZE: File exceeded the php.ini upload maximum for file size.";
                break;
            case 2:
                $this->fileProblem= "UPLOAD_ERR_FORM_SIZE: File exceeded the maximum file size specified in HTML form.";
                break;
            case 3:
                $this->fileProblem= "UPLOAD_ERR_PARTIAL: File was only partially uploaded. Try again.";
                break;
            case 4:
                $this->fileProblem= "UPLOAD_ERR_NO_FILE: No file was uploaded. Be sure to first select file.";
                break;
            case 6:
                $this->fileProblem= "UPLOAD_ERR_NO_TMP_DIR: Missing a temporary folder.";
                break;
            case 7:
                $this->fileProblem= "UPLOAD_ERR_CANT_WRITE: Failed to write file to disk. Check permissions for directory you're writing to.";
                break;
            case 8:
                $this->fileProblem= "UPLOAD_ERR_EXTENSION: A PHP extension stopped the file upload.";
                break; 
        }
        return $this->fileProblem;
    }
}
?>
