SetCompressor /FINAL lzma

!include "MUI.nsh"
!include "LogicLib.nsh"

Name "Mozilla Thunderbird en Francais"
OutFile "Thunderbird Installer - Francais.exe"

InstallDir "$PROGRAMFILES\Mozilla Thunderbird"

!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES

!insertmacro MUI_LANGUAGE "French"

Section ""
	InitPluginsDir
	SetOutPath $PLUGINSDIR
	File /r mozilla.org
	SetOutPath $TEMP
	ExecWait '"$PLUGINSDIR\mozilla.org\setup.exe" /S /D=$INSTDIR' $0
	StrCmp "$0" 0 0 done
	  StrCpy $0 0
	  ClearErrors
	  ReadRegStr $0 HKLM "Software\Mozilla\Mozilla Thunderbird" CurrentVersion
	  IfErrors done
	  ReadRegStr $1 HKLM "Software\Mozilla\Mozilla Thunderbird\$0\Main" "Install Directory"
	  SetOutPath "$1\extensions"
	  File /r inverse.ca\*
	done:
SectionEnd
