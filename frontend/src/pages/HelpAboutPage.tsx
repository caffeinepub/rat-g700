import { useGetMetadata } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';
import { Info, Shield, Package, FileJson } from 'lucide-react';

export default function HelpAboutPage() {
  const { data: metadata } = useGetMetadata();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h2 className="mb-8 text-3xl font-bold tracking-tight">Help & About</h2>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              What is RAT G700?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {metadata && (
              <>
                <div>
                  <h4 className="mb-2 font-semibold">Application Purpose</h4>
                  <p className="text-muted-foreground">{metadata.description}</p>
                </div>
                <Separator />
                <div>
                  <h4 className="mb-2 font-semibold">What is a Build?</h4>
                  <p className="text-muted-foreground">{metadata.definitionBuild}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Alert className="border-primary/50 bg-primary/5">
          <Shield className="h-4 w-4 text-primary" />
          <AlertDescription>
            <strong className="block mb-2">Important Security Notice</strong>
            <p className="text-sm">
              RAT G700 is a legitimate build and configuration management tool. This application does NOT:
            </p>
            <ul className="mt-2 ml-4 list-disc space-y-1 text-sm">
              <li>Provide remote access to devices</li>
              <li>Control or monitor systems</li>
              <li>Capture credentials or sensitive data</li>
              <li>Install persistence mechanisms</li>
              <li>Function as malware or spyware</li>
            </ul>
            <p className="mt-2 text-sm">
              This tool is designed solely for organizing and managing build configurations, parts lists, and project documentation.
            </p>
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <div>
                  <strong>Build Management:</strong> Create, edit, and organize multiple builds with descriptions and metadata.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <div>
                  <strong>Item Tracking:</strong> Add items to builds with quantities, costs, and notes for detailed tracking.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <div>
                  <strong>Cost Calculation:</strong> Automatically calculate total costs based on item quantities and unit prices.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <div>
                  <strong>Search & Filter:</strong> Quickly find builds using the search functionality.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <div>
                  <strong>Data Privacy:</strong> All your data is stored securely and privately under your authenticated identity.
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="h-5 w-5" />
              Import & Export
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="mb-2 font-semibold">Exporting Builds</h4>
              <p className="text-sm text-muted-foreground">
                From any build detail page, click the "Export" button to download a JSON file containing the build and all its items. This allows you to back up your data or share configurations.
              </p>
            </div>
            <Separator />
            <div>
              <h4 className="mb-2 font-semibold">Importing Builds</h4>
              <p className="text-sm text-muted-foreground">
                Use the "Import" button on a build detail page to upload a previously exported JSON file. The system will validate the file and create a new build with all the items. Invalid files will show specific error messages.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              <li className="flex gap-3">
                <span className="font-semibold text-primary">1.</span>
                <div>Click "New Build" on the main page to create your first build.</div>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-primary">2.</span>
                <div>Give your build a name and description.</div>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-primary">3.</span>
                <div>Click on the build to open it and start adding items.</div>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-primary">4.</span>
                <div>Add items with quantities, costs, and notes as needed.</div>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-primary">5.</span>
                <div>Use the export feature to back up your builds or share them.</div>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
