import AppContainer from "@components/layouts/AppContainer";
import AppSideBar from "@components/layouts/AppSideBar";

export default function Home() {
  return (
    <AppContainer>
      <AppSideBar />
      <div className="flex-1"></div>
    </AppContainer>
  );
}
