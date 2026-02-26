import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import JobBoardScreen from './screens/JobBoardScreen';
import JobDetailScreen from './screens/JobDetailScreen';
import ApplyScreen from './screens/ApplyScreen';
import TalentDashboardScreen from './screens/TalentDashboardScreen';
import CompanyJobsScreen from './screens/CompanyJobsScreen';
import ApplicationsReviewScreen from './screens/ApplicationsReviewScreen';

export type RootStackParamList = {
  Home: undefined;
  JobBoard: undefined;
  JobDetail: { jobId: string };
  Apply: { jobId: string };
  TalentDashboard: undefined;
  CompanyJobs: { companyId: string; companyName: string };
  ApplicationsReview: { jobId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#0066FF' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Weir Here' }} />
        <Stack.Screen name="JobBoard" component={JobBoardScreen} options={{ title: 'Job Board' }} />
        <Stack.Screen name="JobDetail" component={JobDetailScreen} options={{ title: 'Job Details' }} />
        <Stack.Screen name="Apply" component={ApplyScreen} options={{ title: 'Apply' }} />
        <Stack.Screen name="TalentDashboard" component={TalentDashboardScreen} options={{ title: 'Talent Dashboard' }} />
        <Stack.Screen name="CompanyJobs" component={CompanyJobsScreen} options={({ route }) => ({ title: route.params.companyName })} />
        <Stack.Screen name="ApplicationsReview" component={ApplicationsReviewScreen} options={{ title: 'Review Applicants' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
