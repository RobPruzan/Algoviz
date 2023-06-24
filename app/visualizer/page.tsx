import Visualize from '@/app/visualizer/Visualize';
import { AlgoComboBox } from '@/app/visualizer/Sort/AlgoComboBox';

import Content from './Content';
import SideBar from './SideBar';
import CodeExecution from './Canvas/CodeExecution';
import Resizable from './Resizeable';
import ContentWrapper from './ContentWrapper';
export const metadata = {};
const page = () => {
  return (
    <div className="h-screen w-screen flex items-display ">
      <div className="h-[95%] w-full ">
        <Content>
          <ContentWrapper />
        </Content>
      </div>
    </div>
  );
};

export default page;
