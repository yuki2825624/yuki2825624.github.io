
Set fs = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("Wscript.Shell")

For i = 1 To 1000
    Set file = fs.CreateTextFile("test" + CStr(i) + ".cmd")
    file.WriteLine("echo test")
    file.WriteLine("timeout /t 1")
    ' shell.Run CStr(i) + "test.cmd"
Next

For i = 1 To 1000
    shell.Run("test" + CStr(i) + ".cmd")
Next