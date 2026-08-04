<#
.SYNOPSIS
Store Manager GUI for Zaynfolio
.DESCRIPTION
A simple GUI to view, add, edit, and delete products in the store.json file.
#>

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

[System.Windows.Forms.Application]::EnableVisualStyles()

$Script:storePath = Join-Path $PSScriptRoot "src\data\store.json"
$Script:assetsSrc = Join-Path $PSScriptRoot "src\assets\store"
$Script:assetsPub = Join-Path $PSScriptRoot "public\assets\store"

# Ensure asset directories exist
if (!(Test-Path $Script:assetsSrc)) { New-Item -ItemType Directory -Force -Path $Script:assetsSrc | Out-Null }
if (!(Test-Path $Script:assetsPub)) { New-Item -ItemType Directory -Force -Path $Script:assetsPub | Out-Null }

# Load Data
$Script:productList = New-Object System.Collections.ArrayList
if (Test-Path $Script:storePath) {
    $json = Get-Content $Script:storePath -Raw | ConvertFrom-Json
    if ($json -ne $null) {
        $Script:productList.AddRange($json)
    }
}

# ─── Form Setup ───
$form = New-Object System.Windows.Forms.Form
$form.Text = "Zaynfolio Store Manager"
$form.Size = New-Object System.Drawing.Size(800, 500)
$form.StartPosition = "CenterScreen"
$form.Font = New-Object System.Drawing.Font("Segoe UI", 9)
$form.FormBorderStyle = "FixedDialog"
$form.MaximizeBox = $false

# ─── Left Panel (List) ───
$listPanel = New-Object System.Windows.Forms.Panel
$listPanel.Dock = "Left"
$listPanel.Width = 250
$listPanel.Padding = New-Object System.Windows.Forms.Padding(10)
$form.Controls.Add($listPanel)

$listBox = New-Object System.Windows.Forms.ListBox
$listBox.Dock = "Fill"
$listBox.DisplayMember = "title"
$listPanel.Controls.Add($listBox)

# ─── Actions panel (Bottom of Left Panel) ───
$btnPanel = New-Object System.Windows.Forms.Panel
$btnPanel.Dock = "Bottom"
$btnPanel.Height = 130
$listPanel.Controls.Add($btnPanel)

$btnAdd = New-Object System.Windows.Forms.Button
$btnAdd.Text = "Add New Product"
$btnAdd.Dock = "Top"
$btnAdd.Height = 35
$btnPanel.Controls.Add($btnAdd)

$btnDelete = New-Object System.Windows.Forms.Button
$btnDelete.Text = "Delete Selected"
$btnDelete.Dock = "Top"
$btnDelete.Height = 35
$btnPanel.Controls.Add($btnDelete)

$btnSave = New-Object System.Windows.Forms.Button
$btnSave.Text = "Save to JSON"
$btnSave.Dock = "Bottom"
$btnSave.Height = 40
$btnSave.BackColor = [System.Drawing.Color]::LightGreen
$btnSave.Font = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)
$btnPanel.Controls.Add($btnSave)

# ─── Right Panel (Form) ───
$formPanel = New-Object System.Windows.Forms.Panel
$formPanel.Dock = "Fill"
$formPanel.Padding = New-Object System.Windows.Forms.Padding(10)
$form.Controls.Add($formPanel)

$y = 20
$spacing = 30
$labelWidth = 100
$controlWidth = 400

function Add-Field($name, $label) {
    $lbl = New-Object System.Windows.Forms.Label
    $lbl.Text = $label
    $lbl.Location = New-Object System.Drawing.Point(10, $y)
    $lbl.Size = New-Object System.Drawing.Size($labelWidth, 20)
    $formPanel.Controls.Add($lbl)

    $txt = New-Object System.Windows.Forms.TextBox
    $txt.Name = $name
    $txt.Location = New-Object System.Drawing.Point($labelWidth + 10, $y)
    $txt.Size = New-Object System.Drawing.Size($controlWidth, 20)
    $formPanel.Controls.Add($txt)
    
    $script:y += $spacing
    return $txt
}

$txtId = Add-Field "txtId" "ID:"
$txtSlug = Add-Field "txtSlug" "Slug:"
$txtTitle = Add-Field "txtTitle" "Title:"
$txtCategory = Add-Field "txtCategory" "Category:"
$txtPrice = Add-Field "txtPrice" "Price:"
$txtCheckout = Add-Field "txtCheckout" "Checkout Link:"
$txtPoster = Add-Field "txtPoster" "Poster Path:"

# Add Browse Button for Poster
$btnBrowse = New-Object System.Windows.Forms.Button
$btnBrowse.Text = "Browse..."
$btnBrowse.Location = New-Object System.Drawing.Point($labelWidth + $controlWidth + 20, $txtPoster.Top - 2)
$btnBrowse.Size = New-Object System.Drawing.Size(75, 25)
$formPanel.Controls.Add($btnBrowse)

# Description Field (Multiline)
$lblDesc = New-Object System.Windows.Forms.Label
$lblDesc.Text = "Description:"
$lblDesc.Location = New-Object System.Drawing.Point(10, $y)
$lblDesc.Size = New-Object System.Drawing.Size($labelWidth, 20)
$formPanel.Controls.Add($lblDesc)

$txtDesc = New-Object System.Windows.Forms.TextBox
$txtDesc.Multiline = $true
$txtDesc.ScrollBars = "Vertical"
$txtDesc.Location = New-Object System.Drawing.Point($labelWidth + 10, $y)
$txtDesc.Size = New-Object System.Drawing.Size($controlWidth, 60)
$formPanel.Controls.Add($txtDesc)
$y += 70

# Features Field (Multiline)
$lblFeat = New-Object System.Windows.Forms.Label
$lblFeat.Text = "Features:`r`n(One per line)"
$lblFeat.Location = New-Object System.Drawing.Point(10, $y)
$lblFeat.Size = New-Object System.Drawing.Size($labelWidth, 40)
$formPanel.Controls.Add($lblFeat)

$txtFeat = New-Object System.Windows.Forms.TextBox
$txtFeat.Multiline = $true
$txtFeat.ScrollBars = "Vertical"
$txtFeat.Location = New-Object System.Drawing.Point($labelWidth + 10, $y)
$txtFeat.Size = New-Object System.Drawing.Size($controlWidth, 60)
$formPanel.Controls.Add($txtFeat)

# ─── Logic ───

function Update-List {
    $listBox.DataSource = $null
    $listBox.DataSource = $Script:productList
    $listBox.DisplayMember = "title"
}

function Load-Selected {
    $sel = $listBox.SelectedItem
    if ($sel -ne $null) {
        $txtId.Text = $sel.id
        $txtSlug.Text = $sel.slug
        $txtTitle.Text = $sel.title
        $txtCategory.Text = $sel.category
        $txtPrice.Text = $sel.price
        $txtCheckout.Text = $sel.checkoutLink
        $txtPoster.Text = $sel.poster
        $txtDesc.Text = $sel.description
        if ($sel.features -ne $null) {
            $txtFeat.Text = ($sel.features -join "`r`n")
        } else {
            $txtFeat.Text = ""
        }
    }
}

function Save-Current-To-Memory {
    $sel = $listBox.SelectedItem
    if ($sel -ne $null) {
        $sel.id = $txtId.Text
        $sel.slug = $txtSlug.Text
        $sel.title = $txtTitle.Text
        $sel.category = $txtCategory.Text
        $sel.price = $txtPrice.Text
        $sel.checkoutLink = $txtCheckout.Text
        $sel.poster = $txtPoster.Text
        $sel.description = $txtDesc.Text
        $sel.features = @($txtFeat.Text -split "`r`n" | Where-Object { $_.Trim() -ne "" })
        
        # Refresh list display if title changed
        $idx = $listBox.SelectedIndex
        Update-List
        $listBox.SelectedIndex = $idx
    }
}

# Event Handlers
$listBox.Add_SelectedIndexChanged({ Load-Selected })

$txtId.Add_Leave({ Save-Current-To-Memory })
$txtSlug.Add_Leave({ Save-Current-To-Memory })
$txtTitle.Add_Leave({ Save-Current-To-Memory })
$txtCategory.Add_Leave({ Save-Current-To-Memory })
$txtPrice.Add_Leave({ Save-Current-To-Memory })
$txtCheckout.Add_Leave({ Save-Current-To-Memory })
$txtPoster.Add_Leave({ Save-Current-To-Memory })
$txtDesc.Add_Leave({ Save-Current-To-Memory })
$txtFeat.Add_Leave({ Save-Current-To-Memory })

$btnAdd.Add_Click({
    $newProd = [PSCustomObject]@{
        id = "new_product"
        slug = "new-product"
        title = "New Product"
        description = ""
        price = "Rp 0"
        checkoutLink = ""
        poster = ""
        category = ""
        features = @()
    }
    $Script:productList.Add($newProd) | Out-Null
    Update-List
    $listBox.SelectedIndex = $Script:productList.Count - 1
})

$btnDelete.Add_Click({
    $sel = $listBox.SelectedItem
    if ($sel -ne $null) {
        $res = [System.Windows.Forms.MessageBox]::Show("Are you sure you want to delete '$($sel.title)'?", "Confirm Delete", [System.Windows.Forms.MessageBoxButtons]::YesNo, [System.Windows.Forms.MessageBoxIcon]::Warning)
        if ($res -eq "Yes") {
            $Script:productList.Remove($sel)
            Update-List
        }
    }
})

$btnBrowse.Add_Click({
    $openFile = New-Object System.Windows.Forms.OpenFileDialog
    $openFile.Filter = "Image Files|*.jpg;*.jpeg;*.png;*.gif;*.webp;*.avif"
    $openFile.Title = "Select Product Image"
    
    if ($openFile.ShowDialog() -eq "OK") {
        $fileName = Split-Path $openFile.FileName -Leaf
        $targetSrc = Join-Path $Script:assetsSrc $fileName
        $targetPub = Join-Path $Script:assetsPub $fileName
        
        try {
            Copy-Item -Path $openFile.FileName -Destination $targetSrc -Force
            Copy-Item -Path $openFile.FileName -Destination $targetPub -Force
            
            $txtPoster.Text = "/assets/store/$fileName"
            Save-Current-To-Memory
            [System.Windows.Forms.MessageBox]::Show("Image copied successfully to assets folder!", "Success", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information)
        } catch {
            [System.Windows.Forms.MessageBox]::Show("Error copying image: $_", "Error", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Error)
        }
    }
})

$btnSave.Add_Click({
    Save-Current-To-Memory
    try {
        # Using ConvertTo-Json and ensuring special characters format correctly
        $json = $Script:productList | ConvertTo-Json -Depth 5
        Set-Content -Path $Script:storePath -Value $json -Encoding UTF8
        [System.Windows.Forms.MessageBox]::Show("Saved successfully to store.json!", "Success", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information)
    } catch {
        [System.Windows.Forms.MessageBox]::Show("Error saving JSON: $_", "Error", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Error)
    }
})

# Initial load
Update-List
if ($Script:productList.Count -gt 0) {
    $listBox.SelectedIndex = 0
}

$form.ShowDialog() | Out-Null
