' Chay server NGAM (an cua so) — bam dup de chay.
' Server chay nen tai http://localhost:3001
' De DUNG: mo Task Manager -> tim "Node.js" -> End task.
Set fso = CreateObject("Scripting.FileSystemObject")
Set sh = CreateObject("WScript.Shell")
sh.CurrentDirectory = fso.GetParentFolderName(WScript.ScriptFullName)
sh.Run "node server.js", 0, False
