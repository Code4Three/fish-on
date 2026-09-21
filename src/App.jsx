import GlobalHeader from "./components/GlobalHeader";
import { AppProvider } from "./state/AppContext";
import { useApp } from "./state/useApp";
import { VIEWS } from "./state/viewConstants";
import MapPickerView from "./views/MapPickerView";
import ManageLocationsView from "./views/ManageLocationsView";
import OptionsView from "./views/OptionsView";
import SolunarView from "./views/SolunarView";
import TideView from "./views/TideView";
import WeeklyView from "./views/WeeklyView";

function ActiveView() {
	const { activeView } = useApp();

	switch (activeView) {
		case VIEWS.TIDE:
			return <TideView />;
		case VIEWS.SOLUNAR:
			return <SolunarView />;
		case VIEWS.OPTIONS:
			return <OptionsView />;
		case VIEWS.MAP_PICKER:
			return <MapPickerView />;
		case VIEWS.MANAGE_LOCATIONS:
			return <ManageLocationsView />;
		case VIEWS.WEEKLY:
		default:
			return <WeeklyView />;
	}
}

function App() {
	return (
		<AppProvider>
			<GlobalHeader />
			<ActiveView />
		</AppProvider>
	);
}

export default App;