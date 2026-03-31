$srcDir = "c:\Users\gavin\Downloads\booty-warrior-app\src"
$files = Get-ChildItem -Path $srcDir -Recurse -Filter "*.js" | Where-Object { $_.FullName -notmatch "node_modules" }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    # Find all components used in JSX like <IconName ... /> or IconName
    $usedIcons = [regex]::Matches($content, '<([A-Z]\w+)\b').Value | ForEach-Object { $_.TrimStart('<') }
    $usedIcons += [regex]::Matches($content, '\b([A-Z]\w+)\b').Value | Where-Object { 
        # Filter for known lucide icons or common patterns
        $line = Get-Content $file.FullName | Select-String $_
        $line -match 'Icon:' -or $line -match 'icon:' -or $line -match 'Icon ='
    } | ForEach-Object { $_ }
    
    $usedIcons = $usedIcons | Select-Object -Unique | Where-Object { $_ -match '^[A-Z]' -and $_ -ne 'React' -and $_ -ne 'Fragment' }

    if ($usedIcons) {
        $importMatch = [regex]::Match($content, "import \{ ([^}]+) \} from 'lucide-react'")
        if ($importMatch.Success) {
            $importedIcons = $importMatch.Groups[1].Value.Split(',') | ForEach-Object { $_.Trim() }
            $missing = $usedIcons | Where-Object { $importedIcons -notcontains $_ -and $_ -ne 'const' -and $_ -ne 'export' }
            if ($missing) {
                Write-Host "File: $($file.FullName)"
                Write-Host "  Missing Icons: $($missing -join ', ')"
            }
        } elseif ($content -match '<[A-Z]\w+') {
             # No lucide-react import but uses capitalized tags
             # This might be custom components, but let's list them
             Write-Host "File: $($file.FullName)"
             Write-Host "  No lucide-react import but uses: $($usedIcons -join ', ')"
        }
    }
}
