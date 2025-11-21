import { JSX } from "react";
import { Progress } from "@components/ui/progress"
import { Spinner } from "../../components/ui/spinner";
import { useUpdater } from "../../contexts/UpdaterContext";


export default function Updater(): JSX.Element {
    const { status, progress, error } = useUpdater()
    const renderStatus = (): string => {
        switch (status) {
            case "checking":
                return "Checking for updates..."
            case "available":
                return "New update available. Preparing download..."
            case "downloading":
                return `Downloading ${Math.round(progress)}%`
            case "downloaded":
                return "Update downloaded — restarting app..."
            case "not-available":
                return "App is already up to date."
            case "error":
                return `Update failed: ${error || "Unknown error"}`
            default:
                return "Preparing update.."
        }
    }
    return (
        <>
            <Spinner className="size-12" />
            <h1 className='text-slate-800 text-2xl font-medium'>
                {renderStatus()}
            </h1>
            <Progress value={progress} className="w-full" />
            <p className='text-slate-600 font-medium'>
                Don&#39;t turn off your PC. This will take a while.
            </p>
        </>
    )
}
