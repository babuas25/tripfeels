'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, Type, Image, Save, Eye } from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

export default function SuperAdminThemePage() {
  const { logoType, textLogo, logoImage, colorTheme, setLogoType, setTextLogo, setLogoImage, setColorTheme, saveThemeSettings } = useTheme()
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setLogoPreview(result)
        setLogoImage(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    saveThemeSettings()
    // Show success message or toast
    console.log('Theme settings saved successfully')
  }

  const handleColorThemeSelect = (theme: string) => {
    setColorTheme(theme)
  }

  const handlePreview = () => {
    // TODO: Implement preview functionality
    console.log('Previewing theme changes')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Theme Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Customize your application&apos;s appearance, logo, and branding.
        </p>
      </div>

      <Tabs defaultValue="logo" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="logo">Logo Settings</TabsTrigger>
          <TabsTrigger value="colors">Color Scheme</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="logo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Logo Configuration
              </CardTitle>
              <CardDescription>
                Choose between text or image logo for header and sidebar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Type Selection */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Logo Type</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      logoType === 'text'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setLogoType('text')}
                  >
                    <div className="flex items-center gap-3">
                      <Type className="h-6 w-6" />
                      <div>
                        <h3 className="font-medium">Text Logo</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Use custom text as logo
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      logoType === 'image'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setLogoType('image')}
                  >
                    <div className="flex items-center gap-3">
                      <Image className="h-6 w-6" />
                      <div>
                        <h3 className="font-medium">Image Logo</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Upload SVG logo (64px × 28px)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Logo Configuration */}
              {logoType === 'text' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="textLogo">Logo Text</Label>
                    <Input
                      id="textLogo"
                      value={textLogo}
                      onChange={(e) => setTextLogo(e.target.value)}
                      placeholder="Enter logo text"
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      This text will appear in both header and sidebar
                    </p>
                  </div>
                  
                  {/* Text Logo Preview */}
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-4">
                        <div className="text-lg font-semibold font-logo text-gray-900 dark:text-gray-100">
                          {textLogo}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Header Preview
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Image Logo Configuration */}
              {logoType === 'image' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="logoFile">Upload Logo</Label>
                    <div className="mt-1">
                      <Input
                        id="logoFile"
                        type="file"
                        accept=".svg"
                        onChange={handleFileUpload}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Upload SVG file with dimensions 64px wide × 28px height
                    </p>
                  </div>

                  {/* Image Logo Preview */}
                  {logoPreview && (
                    <div className="space-y-2">
                      <Label>Preview</Label>
                      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-7 flex items-center justify-center">
                            <img
                              src={logoPreview}
                              alt="Logo Preview"
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Header Preview (64px × 28px)
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button onClick={handleSave} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handlePreview} className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Color Scheme</CardTitle>
              <CardDescription>
                Choose from predefined color themes that work in both light and dark modes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Color Theme Selection */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Select Color Theme</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Rose Theme */}
                  <div 
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      colorTheme === 'rose'
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-rose-300 dark:hover:border-rose-600'
                    }`}
                    onClick={() => handleColorThemeSelect('rose')}
                  >
                    <div className="space-y-3">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">Rose</h3>
                      <div className="flex gap-1">
                        <div className="w-8 h-8 bg-rose-50 rounded border"></div>
                        <div className="w-8 h-8 bg-rose-300 rounded border"></div>
                        <div className="w-8 h-8 bg-rose-600 rounded border"></div>
                        <div className="w-8 h-8 bg-rose-900 rounded border"></div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Elegant rose tones for a sophisticated look
                      </p>
                    </div>
                  </div>

                  {/* Emerald Theme */}
                  <div 
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      colorTheme === 'emerald'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600'
                    }`}
                    onClick={() => handleColorThemeSelect('emerald')}
                  >
                    <div className="space-y-3">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">Emerald</h3>
                      <div className="flex gap-1">
                        <div className="w-8 h-8 bg-emerald-50 rounded border"></div>
                        <div className="w-8 h-8 bg-emerald-300 rounded border"></div>
                        <div className="w-8 h-8 bg-emerald-600 rounded border"></div>
                        <div className="w-8 h-8 bg-emerald-900 rounded border"></div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Fresh emerald greens for a natural feel
                      </p>
                    </div>
                  </div>

                  {/* Slate Theme */}
                  <div 
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      colorTheme === 'slate'
                        ? 'border-slate-500 bg-slate-50 dark:bg-slate-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                    onClick={() => handleColorThemeSelect('slate')}
                  >
                    <div className="space-y-3">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">Slate</h3>
                      <div className="flex gap-1">
                        <div className="w-8 h-8 bg-slate-50 rounded border"></div>
                        <div className="w-8 h-8 bg-slate-300 rounded border"></div>
                        <div className="w-8 h-8 bg-slate-600 rounded border"></div>
                        <div className="w-8 h-8 bg-slate-900 rounded border"></div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Professional slate grays for business use
                      </p>
                    </div>
                  </div>

                  {/* Orange Theme */}
                  <div 
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      colorTheme === 'orange'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600'
                    }`}
                    onClick={() => handleColorThemeSelect('orange')}
                  >
                    <div className="space-y-3">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">Orange</h3>
                      <div className="flex gap-1">
                        <div className="w-8 h-8 bg-orange-50 rounded border"></div>
                        <div className="w-8 h-8 bg-orange-300 rounded border"></div>
                        <div className="w-8 h-8 bg-orange-600 rounded border"></div>
                        <div className="w-8 h-8 bg-orange-900 rounded border"></div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Vibrant orange for energy and creativity
                      </p>
                    </div>
                  </div>

                  {/* Blue Theme */}
                  <div 
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      colorTheme === 'blue'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                    }`}
                    onClick={() => handleColorThemeSelect('blue')}
                  >
                    <div className="space-y-3">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">Blue</h3>
                      <div className="flex gap-1">
                        <div className="w-8 h-8 bg-blue-50 rounded border"></div>
                        <div className="w-8 h-8 bg-blue-300 rounded border"></div>
                        <div className="w-8 h-8 bg-blue-600 rounded border"></div>
                        <div className="w-8 h-8 bg-blue-900 rounded border"></div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Trustworthy blue for reliability
                      </p>
                    </div>
                  </div>

                  {/* Gold Theme */}
                  <div 
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      colorTheme === 'gold'
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-yellow-300 dark:hover:border-yellow-600'
                    }`}
                    onClick={() => handleColorThemeSelect('gold')}
                  >
                    <div className="space-y-3">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">Gold</h3>
                      <div className="flex gap-1">
                        <div className="w-8 h-8 bg-yellow-50 rounded border"></div>
                        <div className="w-8 h-8 bg-yellow-300 rounded border"></div>
                        <div className="w-8 h-8 bg-yellow-600 rounded border"></div>
                        <div className="w-8 h-8 bg-yellow-900 rounded border"></div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Luxurious gold for premium branding
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Color Customization */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Customize Colors</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Light Mode Colors */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Light Mode</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Label className="w-20 text-sm">Primary</Label>
                        <div className="flex-1 flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-600 rounded border"></div>
                          <Input type="text" value="#2563eb" className="flex-1" readOnly />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Label className="w-20 text-sm">Secondary</Label>
                        <div className="flex-1 flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-100 rounded border"></div>
                          <Input type="text" value="#f3f4f6" className="flex-1" readOnly />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Label className="w-20 text-sm">Accent</Label>
                        <div className="flex-1 flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded border"></div>
                          <Input type="text" value="#dbeafe" className="flex-1" readOnly />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dark Mode Colors */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Dark Mode</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Label className="w-20 text-sm">Primary</Label>
                        <div className="flex-1 flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-400 rounded border"></div>
                          <Input type="text" value="#60a5fa" className="flex-1" readOnly />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Label className="w-20 text-sm">Secondary</Label>
                        <div className="flex-1 flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-800 rounded border"></div>
                          <Input type="text" value="#1f2937" className="flex-1" readOnly />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Label className="w-20 text-sm">Accent</Label>
                        <div className="flex-1 flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-700 rounded border"></div>
                          <Input type="text" value="#374151" className="flex-1" readOnly />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button onClick={handleSave} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Apply Theme
                </Button>
                <Button variant="outline" onClick={handlePreview} className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme Preview</CardTitle>
              <CardDescription>
                Preview your theme changes before applying
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Theme preview will be implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
